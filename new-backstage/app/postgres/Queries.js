
const QUERY_CHECK_TABLE_USER_CONFIG_EXIST = 'SELECT * FROM information_schema.tables WHERE table_name=\'user_config\';';

const QUERY_CREATE_TABLE_USER_CONFIG = 'CREATE TABLE user_config ( '
  + 'tenant varchar(255) NOT NULL, '
  + 'username varchar(255) NOT NULL,'
  + 'configuration json NOT NULL, '
  + 'last_update timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP, '
  + 'CONSTRAINT unique_user PRIMARY KEY (tenant, username) '
  + ');';


module.exports = { QUERY_CHECK_TABLE_USER_CONFIG_EXIST, QUERY_CREATE_TABLE_USER_CONFIG };
