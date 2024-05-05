CREATE MIGRATION m1fe7wbcju2aoezpcsz5lvjd5w6gs5svnbghk3pjg2nwrdcbaxr7ga
    ONTO m1ip7a4kvzqxvls3xiytud7f4rmy5bumurrzwdhhi6ze6souqyjknq
{
  ALTER TYPE default::Domain {
      DROP LINK inbox;
  };
  ALTER TYPE default::Inbox {
      DROP LINK user;
  };
};
