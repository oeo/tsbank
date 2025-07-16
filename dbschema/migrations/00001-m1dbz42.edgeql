CREATE MIGRATION m1dbz42rw2q4fuvye53cs4ux7wcmzqeqhdrkkwv32nibspi5yt3gda
    ONTO initial
{
  CREATE SCALAR TYPE default::EventName EXTENDING enum<`customer.created`, `customer.verified`, `customer.risk_level.updated`, `customer.manual_review.flagged`, `account.created`, `account.deposited`, `account.withdrawn`, `account.closed`, `account.bitcoin_wallet.required`, `transaction.created`, `transaction.completed`, `transaction.failed`>;
  CREATE TYPE default::AggregateVersion {
      CREATE REQUIRED PROPERTY aggregate_id: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY version: std::int64;
  };
  CREATE TYPE default::DomainEvent {
      CREATE REQUIRED PROPERTY aggregate_id: std::str;
      CREATE INDEX ON (.aggregate_id);
      CREATE REQUIRED PROPERTY event_id: std::uuid {
          SET default := (std::uuid_generate_v4());
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY event_name: default::EventName;
      CREATE REQUIRED PROPERTY occurred_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY payload: std::json;
      CREATE REQUIRED PROPERTY version: std::int64;
  };
};
