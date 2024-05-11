CREATE MIGRATION m1jd4mis2bsqtzqjxlu3fm56xhisrcg5sqauw4uccxev7dqr7ya3rq
    ONTO m1jyktt7euibr644ddvghy4bdiljjyczzj63pgvgsjfbdannjm3doa
{
  ALTER TYPE default::ReplyProxy {
      ALTER PROPERTY brokerEmail {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
