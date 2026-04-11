CREATE TABLE "refreshtokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" uuid NOT NULL,
	"token" text NOT NULL,
	"expiresat" timestamp NOT NULL,
	"createdat" timestamp DEFAULT now(),
	"revokedat" timestamp,
	CONSTRAINT "refreshtokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "savedpasswords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"login" varchar(255) NOT NULL,
	"secondlogin" varchar(255),
	"passwordhash" text NOT NULL,
	"isfavourite" boolean DEFAULT true NOT NULL,
	"url" text,
	"notes" text,
	"tags" text[],
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userrequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" uuid NOT NULL,
	"requesttype" text NOT NULL,
	"expiresat" timestamp NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"originalusername" varchar(255) NOT NULL,
	"passwordhash" text NOT NULL,
	"salt" varchar(255) NOT NULL,
	"passwordsalt" text NOT NULL,
	"createdat" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "refreshtokens" ADD CONSTRAINT "refreshtokens_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savedpasswords" ADD CONSTRAINT "savedpasswords_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userrequests" ADD CONSTRAINT "userrequests_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;