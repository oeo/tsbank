module default {
    
    scalar type EventName extending enum<
        'customer.created',
        'customer.verified',
        'customer.risk_level.updated',
        'customer.manual_review.flagged',
        'account.created',
        'account.deposited',
        'account.withdrawn',
        'account.closed',
        'account.bitcoin_wallet.required',
        'transaction.created',
        'transaction.completed',
        'transaction.failed',
        'TestEvent1',
        'TestEvent2',
        'InitialEvent',
        'SecondEvent',
        'FirstEvent'
    >;
    
    type DomainEvent {
        required property event_id -> uuid {
            constraint exclusive;
            default := uuid_generate_v4();
        }
        
        required property aggregate_id -> str;
        required property event_name -> EventName;
        required property payload -> json;
        required property occurred_at -> datetime {
            default := datetime_current();
        }
        required property version -> int64;
        
        index on (.aggregate_id);
    }
    
    type AggregateVersion {
        required property aggregate_id -> str {
            constraint exclusive;
        }
        required property version -> int64;
    }
} 