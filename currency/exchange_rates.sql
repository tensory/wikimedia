-- create exchange_rates table
create table exchange_rates (
	currency varchar(3) not null default '',
	base varchar(3) not null default 'USD',
	rate float not null default 0.0
)