create table if not exists drawings(
	id int auto_increment,
	u_id int not null,
    commandes blob not null,
    images blob not null,
    primary key(id)
);