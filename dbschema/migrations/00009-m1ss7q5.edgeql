CREATE MIGRATION m1ss7q52u4dtzpzla2qzbblhvadydzj3qyrxw3ibkx4c6niazf47tq
    ONTO m1fe7wbcju2aoezpcsz5lvjd5w6gs5svnbghk3pjg2nwrdcbaxr7ga
{
  ALTER TYPE default::Domain {
      ALTER PROPERTY domain {
          RENAME TO name;
      };
  };
  DROP TYPE default::InboxReplier;
};
