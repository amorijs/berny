CREATE MIGRATION m1hcpfppmxrwee4dsuh6atdmoutkrormosxhb6wzgaqarryxkgyj3q
    ONTO m1e4j2sl33jasdk77rpuhif4klfmi65zv7v6d4ew7nwsh3noyy6cyq
{
  CREATE TYPE default::Domain {
      CREATE REQUIRED LINK inbox: default::Inbox;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY domain: std::str;
  };
  ALTER TYPE default::Inbox {
      DROP PROPERTY domains;
  };
  ALTER TYPE default::Inbox {
      CREATE REQUIRED MULTI LINK domains: default::Domain {
          SET REQUIRED USING (<default::Domain>{});
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
};
