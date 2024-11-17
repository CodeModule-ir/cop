-- Seeding the User table
INSERT INTO "User" (telegram_id, username, first_name,role, warnings, approved_groups,created_at,updated_at)
VALUES
  (111222333, 'user1','fuser1' ,'admin', 0, ARRAY[123456789, 987654321],NOW(),NOW()),
  (444555666, 'user2', 'fuser2','owner', 2, ARRAY[987654321],NOW(),NOW()),
  (777888999, 'user3','fuser3' ,'user', 0, ARRAY[123456789],NOW(),NOW()),
  (333444555, 'user4', 'fuser4','user', 1, ARRAY[123456789, 987654321],NOW(),NOW());
-- Seeding the Group table
INSERT INTO "Group" (group_id, group_name, black_list, chat_permissions, updated_at, joined_at, approved_users, warnings,welcome_message,members)
VALUES
  (123456789, 'Test Group 1', ARRAY['BadWord1', 'BadWord2'], '{"can_post": true, "can_message": true}', NOW(), NOW(), ARRAY[1, 2], ARRAY[0],'welcome message',ARRAY[0,2]),
  (987654321, 'Test Group 2', ARRAY['OffensiveUser1'], '{"can_post": false, "can_message": false}', NOW(), NOW(), ARRAY[3, 4], ARRAY[1],'welcome message2',ARRAY[3,4]);
-- Seeding the Warning table after Group data has been inserted
INSERT INTO "Warning" (user_id, group_id, warned_at, reason)
VALUES
  (1, 1, NOW(), 'Spamming'),
  (2, 2, NOW(), 'Offensive behavior');
-- Seeding the Channel table
INSERT INTO "Channel" (name, channel_id, admins)
VALUES
  ('Test Channel 1', 100010001, ARRAY[1, 2]),
  ('Test Channel 2', 200020002, ARRAY[3, 4]);
-- Seeding the GroupRule table
INSERT INTO "GroupRule" (group_id, rule_text, added_by)
VALUES
  (1, ARRAY['No spamming allowed'], 1),
  (2, ARRAY['Be respectful to others'], 2);