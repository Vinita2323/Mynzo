/**
 * Moderation / Report / Block unit + integration-style tests.
 * Run: npm test (from Backend/)
 *
 * Uses Node's built-in test runner. DB-backed cases run against
 * mongodb-memory-server when available; otherwise pure logic tests still run.
 */
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const {
  REPORT_REASONS,
  applyBlockFilterToQuery,
  createContentReport,
  blockUser,
  unblockUser,
  getBlockedUserIds
} = require('../services/moderationService');
const ContentReport = require('../Models/ContentReport');
const UserBlock = require('../Models/UserBlock');
const ModerationEvent = require('../Models/ModerationEvent');
const Reel = require('../Models/Reel');
const User = require('../Models/User');

describe('moderationService — pure helpers', () => {
  it('exposes the required report reasons', () => {
    assert.ok(REPORT_REASONS.includes('spam'));
    assert.ok(REPORT_REASONS.includes('harassment'));
    assert.ok(REPORT_REASONS.includes('hate_speech'));
    assert.ok(REPORT_REASONS.includes('violence'));
    assert.ok(REPORT_REASONS.includes('inappropriate_content'));
    assert.ok(REPORT_REASONS.includes('copyright'));
    assert.ok(REPORT_REASONS.includes('other'));
  });

  it('applyBlockFilterToQuery excludes blocked creators via $nin', () => {
    const blocked = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId()
    ];
    const query = { status: 'approved' };
    applyBlockFilterToQuery(query, blocked);
    assert.deepEqual(query.uploadedBy.$nin, blocked);
    assert.equal(query.status, 'approved');
  });

  it('applyBlockFilterToQuery is a no-op when block list is empty', () => {
    const query = { status: 'approved' };
    applyBlockFilterToQuery(query, []);
    assert.equal(query.uploadedBy, undefined);
  });
});

describe('moderationService — DB flows', async () => {
  let mongoAvailable = false;
  let userA;
  let userB;
  let userC;
  let reelB1;
  let reelB2;
  let reelC;

  before(async () => {
    try {
      let MemoryServer;
      try {
        ({ MongoMemoryServer: MemoryServer } = require('mongodb-memory-server'));
      } catch (_) {
        console.log('[tests] mongodb-memory-server not installed — skipping DB tests');
        return;
      }

      const mongod = await MemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      global.__MODERATION_TEST_MONGOD__ = mongod;
      mongoAvailable = true;
    } catch (err) {
      console.log('[tests] Could not start memory MongoDB:', err.message);
      mongoAvailable = false;
    }
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (global.__MODERATION_TEST_MONGOD__) {
      await global.__MODERATION_TEST_MONGOD__.stop();
    }
  });

  beforeEach(async () => {
    if (!mongoAvailable) return;
    await Promise.all([
      User.deleteMany({}),
      Reel.deleteMany({}),
      ContentReport.deleteMany({}),
      UserBlock.deleteMany({}),
      ModerationEvent.deleteMany({})
    ]);

    userA = await User.create({ phone: '9000000001', name: 'User A', isVerified: true });
    userB = await User.create({ phone: '9000000002', name: 'User B', isVerified: true });
    userC = await User.create({ phone: '9000000003', name: 'User C', isVerified: true });

    const productId = new mongoose.Types.ObjectId();

    reelB1 = await Reel.create({
      productId,
      uploadedBy: userB._id,
      userModel: 'User',
      userType: 'user',
      username: 'userb',
      video: '/uploads/videos/b1.mp4',
      status: 'approved',
      section: 'following',
      caption: 'B1'
    });
    reelB2 = await Reel.create({
      productId,
      uploadedBy: userB._id,
      userModel: 'User',
      userType: 'user',
      username: 'userb',
      video: '/uploads/videos/b2.mp4',
      status: 'approved',
      section: 'following',
      caption: 'B2'
    });
    reelC = await Reel.create({
      productId,
      uploadedBy: userC._id,
      userModel: 'User',
      userType: 'user',
      username: 'userc',
      video: '/uploads/videos/c1.mp4',
      status: 'approved',
      section: 'following',
      caption: 'C1'
    });
  });

  it('authenticated user can report a video and creates admin event', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    const result = await createContentReport({
      reporterId: userA._id,
      targetType: 'video',
      targetId: reelB1._id,
      reason: 'inappropriate_content',
      description: 'Looks unsafe'
    });

    assert.equal(result.alreadyReported, false);
    assert.ok(result.report._id);
    assert.equal(result.report.reportedUserId.toString(), userB._id.toString());
    assert.equal(result.report.reporterId.toString(), userA._id.toString());
    assert.equal(result.report.status, 'pending');

    const events = await ModerationEvent.find({ eventType: 'CONTENT_REPORTED' });
    assert.equal(events.length, 1);
    assert.equal(events[0].reportId.toString(), result.report._id.toString());
    assert.equal(events[0].targetVideoId.toString(), reelB1._id.toString());
  });

  it('rejects invalid report reason', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await assert.rejects(
      () => createContentReport({
        reporterId: userA._id,
        targetType: 'video',
        targetId: reelB1._id,
        reason: 'not_a_real_reason'
      }),
      (err) => err.status === 400 && /Invalid report reason/.test(err.message)
    );
  });

  it('rejects report for missing video', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await assert.rejects(
      () => createContentReport({
        reporterId: userA._id,
        targetType: 'video',
        targetId: new mongoose.Types.ObjectId(),
        reason: 'spam'
      }),
      (err) => err.status === 404
    );
  });

  it('rejects self-report of own content', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await assert.rejects(
      () => createContentReport({
        reporterId: userB._id,
        targetType: 'video',
        targetId: reelB1._id,
        reason: 'spam'
      }),
      (err) => err.status === 400 && /own content/.test(err.message)
    );
  });

  it('handles duplicate pending reports idempotently', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await createContentReport({
      reporterId: userA._id,
      targetType: 'video',
      targetId: reelB1._id,
      reason: 'spam'
    });
    const second = await createContentReport({
      reporterId: userA._id,
      targetType: 'video',
      targetId: reelB1._id,
      reason: 'harassment'
    });

    assert.equal(second.alreadyReported, true);
    const count = await ContentReport.countDocuments({
      reporterId: userA._id,
      targetId: reelB1._id
    });
    assert.equal(count, 1);
  });

  it('blocks another user, is idempotent, and creates safety event', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    const first = await blockUser({ blockerId: userA._id, blockedUserId: userB._id, relatedVideoId: reelB1._id });
    assert.equal(first.isBlocked, true);
    assert.equal(first.alreadyBlocked, false);

    const second = await blockUser({ blockerId: userA._id, blockedUserId: userB._id });
    assert.equal(second.alreadyBlocked, true);

    const blocks = await UserBlock.countDocuments({ blockerId: userA._id, blockedUserId: userB._id });
    assert.equal(blocks, 1);

    const events = await ModerationEvent.find({ eventType: 'USER_BLOCKED_FOR_SAFETY' });
    assert.equal(events.length, 1);
  });

  it('prevents self-block', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await assert.rejects(
      () => blockUser({ blockerId: userA._id, blockedUserId: userA._id }),
      (err) => err.status === 400 && /yourself/.test(err.message)
    );
  });

  it('persists block and excludes blocked creators from feed query', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await blockUser({ blockerId: userA._id, blockedUserId: userB._id });
    const blockedIds = await getBlockedUserIds(userA._id);
    assert.equal(blockedIds.length, 1);
    assert.equal(blockedIds[0].toString(), userB._id.toString());

    const query = { status: 'approved' };
    applyBlockFilterToQuery(query, blockedIds);
    const feed = await Reel.find(query).sort({ createdAt: -1 });

    assert.equal(feed.length, 1);
    assert.equal(feed[0]._id.toString(), reelC._id.toString());
    assert.ok(!feed.some((r) => r.uploadedBy.toString() === userB._id.toString()));
  });

  it('removes all videos from the same blocked user', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await blockUser({ blockerId: userA._id, blockedUserId: userB._id });
    const blockedIds = await getBlockedUserIds(userA._id);
    const query = { status: 'approved' };
    applyBlockFilterToQuery(query, blockedIds);
    const feed = await Reel.find(query);

    assert.ok(!feed.some((r) => r._id.toString() === reelB1._id.toString()));
    assert.ok(!feed.some((r) => r._id.toString() === reelB2._id.toString()));
    assert.ok(feed.some((r) => r._id.toString() === reelC._id.toString()));
  });

  it('supports unblock', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    await blockUser({ blockerId: userA._id, blockedUserId: userB._id });
    const result = await unblockUser({ blockerId: userA._id, blockedUserId: userB._id });
    assert.equal(result.isBlocked, false);
    assert.equal(result.wasBlocked, true);

    const blockedIds = await getBlockedUserIds(userA._id);
    assert.equal(blockedIds.length, 0);
  });

  it('never trusts client reportedUserId — derives owner from reel', async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB memory server unavailable');

    const result = await createContentReport({
      reporterId: userA._id,
      targetType: 'video',
      targetId: reelC._id,
      reason: 'spam',
      // Even if a client tried to pass a fake owner, service ignores it
      reportedUserId: userB._id
    });

    assert.equal(result.report.reportedUserId.toString(), userC._id.toString());
  });
});
