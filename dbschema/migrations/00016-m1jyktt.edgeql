CREATE MIGRATION m1jyktt7euibr644ddvghy4bdiljjyczzj63pgvgsjfbdannjm3doa
    ONTO m1gp77l3xj6uhrnv7cugk2cslaqffyybehzgtghgkbberslosxaeba
{
  CREATE TYPE default::ReplyProxy {
      CREATE REQUIRED SINGLE LINK inbox: default::Inbox {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY brokerEmail: std::str;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY externalEmail: std::str;
  };
  ALTER TYPE default::Inbox {
      CREATE MULTI LINK replyProxies := (.<inbox[IS default::ReplyProxy]);
  };
};
