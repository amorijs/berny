CREATE MIGRATION m1hjzrokefwg4xda6k63w7dwftpkec6e7ja4kr47wod36e6jayretq
    ONTO m1akt2c734jjbbbclmxsosz3z56grcyobrp7vhnqkjcemddwe5je7a
{
  CREATE TYPE default::EmailVerification {
      CREATE REQUIRED SINGLE LINK user: default::User;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY expiresAt: std::datetime;
      CREATE REQUIRED PROPERTY newEmail: std::str;
      CREATE REQUIRED PROPERTY oldEmail: std::str;
      CREATE REQUIRED PROPERTY otp: std::str;
  };
};
