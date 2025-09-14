-- Add the users capability to the User role
INSERT INTO `role_capabilities` (`role_id`, `capability_id`)
SELECT 
  (SELECT id FROM roles WHERE name = 'User'),
  (SELECT id FROM capabilities WHERE scheme = 'api' AND hier_part = '/users' AND namespace = 'users' AND segments = 'GET');
