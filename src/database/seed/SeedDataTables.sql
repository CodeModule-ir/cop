-- Seeding the Group table
INSERT INTO Group (group_id, group_name, rules, added_by_id, black_list, chat_permissions, updated_at, joined_at, approved_users, warnings, is_spam_time, members)
VALUES
  (123456789, 'Test Group 1', ARRAY['Rule 1', 'Rule 2'], 1, ARRAY['BadWord1', 'BadWord2'], '{"can_post": true, "can_message": true}', NOW(), NOW(), ARRAY[1, 2], 0, FALSE, 10),
  (987654321, 'Test Group 2', ARRAY['Rule A', 'Rule B'], 2, ARRAY['OffensiveUser1'], '{"can_post": false, "can_message": false}', NOW(), NOW(), ARRAY[3, 4], 1, TRUE, 15);
-- Seeding the User table
INSERT INTO User (telegram_id, username, role, warnings, approved_groups)
VALUES
  (111222333, 'user1', 'admin', 0, ARRAY[123456789, 987654321]),
  (444555666, 'user2', 'moderator', 2, ARRAY[987654321]),
  (777888999, 'user3', 'user', 0, ARRAY[123456789]),
  (333444555, 'user4', 'user', 1, ARRAY[123456789, 987654321]);
-- Seeding the Warning table
INSERT INTO Warning (user_id, group_id, warned_at, reason)
VALUES
  (1, 123456789, NOW(), 'Spamming'),
  (2, 987654321, NOW(), 'Offensive behavior');
-- Seeding the ApprovedUser table
INSERT INTO ApprovedUser (user_id, group_id, username)
VALUES
  (1, 123456789, 'user1'),
  (2, 987654321, 'user2');
-- Seeding the Channel table
INSERT INTO Channel (name, channel_id, admins)
VALUES
  ('Test Channel 1', 100010001, ARRAY[1, 2]),
  ('Test Channel 2', 200020002, ARRAY[3, 4]);
-- Seeding the GroupAdminPermissions table
INSERT INTO GroupAdminPermissions (group_id, user_id, can_manage_approvals, can_manage_users, can_manage_blacklist, can_manage_rules, can_manage_pinning, can_manage_messages, can_manage_group_settings, can_view_group_stats, can_broadcast_message, can_view_admin_list)
VALUES
  (123456789, 1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
  (987654321, 2, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE);
-- Seeding the Blacklist table
INSERT INTO Blacklist (group_id, blacklisted_word, blacklisted_user_id)
VALUES
  (123456789, 'BadWord1', NULL),
  (987654321, 'OffensiveUser1', 333444555);
-- Seeding the GroupRule table
INSERT INTO GroupRule (group_id, rule_text, added_by)
VALUES
  (123456789, 'No spamming allowed', 1),
  (987654321, 'Be respectful to others', 2);
-- Seeding the GroupMessageSettings table
INSERT INTO GroupMessageSettings (group_id, is_locked welcome_message)
VALUES
  (123456789, FALSE,  'Welcome to the group!'),
  (987654321, TRUE, 'Group is locked, no messages allowed');
