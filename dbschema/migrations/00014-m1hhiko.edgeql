CREATE MIGRATION m1hhikow7tyliexhsmabcxhf4ewybui5r74xmxwhgk5dfe67ybmmnq
    ONTO m1v25kepufs3qxgzsbqdq56i5bndhninukh2zbqmwe6w2e7ncx3z5q
{
  ALTER TYPE default::User {
      ALTER PROPERTY email {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
