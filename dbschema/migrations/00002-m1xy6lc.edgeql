CREATE MIGRATION m1xy6lclummwg7doxrm54ybb7vdnddtxkk2gl73dq263l2stgmvhtq
    ONTO m1dbz42rw2q4fuvye53cs4ux7wcmzqeqhdrkkwv32nibspi5yt3gda
{
  ALTER SCALAR TYPE default::EventName EXTENDING enum<`customer.created`, `customer.verified`, `customer.risk_level.updated`, `customer.manual_review.flagged`, `account.created`, `account.deposited`, `account.withdrawn`, `account.closed`, `account.bitcoin_wallet.required`, `transaction.created`, `transaction.completed`, `transaction.failed`, TestEvent1, TestEvent2, InitialEvent, SecondEvent, FirstEvent>;
};
