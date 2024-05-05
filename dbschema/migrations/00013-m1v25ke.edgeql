CREATE MIGRATION m1v25kepufs3qxgzsbqdq56i5bndhninukh2zbqmwe6w2e7ncx3z5q
    ONTO m1ghyl3niuz23g3qmvxfq3vfirlxjmjda5qsbrfhntj6kzlqyc4dfa
{
  ALTER TYPE default::Domain {
      ALTER LINK inbox {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
