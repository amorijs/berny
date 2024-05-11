CREATE MIGRATION m1foqxa7ox46oxdjnwi6xq7hvw2f2443qpclysqdksnorepkglo5oa
    ONTO m1jd4mis2bsqtzqjxlu3fm56xhisrcg5sqauw4uccxev7dqr7ya3rq
{
  ALTER TYPE default::Inbox {
      DROP LINK replyProxies;
  };
  DROP TYPE default::ReplyProxy;
};
