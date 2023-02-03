
export interface RTMMessage {
    id: string;
    cdate: string;
    author: string;
    payload: string;
    signature: string;
}

/* 
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cdate TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  author varchar(1024),
  payload jsonb,
  signature varchar(1024)
*/

