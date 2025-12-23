import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766512403238 implements MigrationInterface {
    name = 'Migration1766512403238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Sessions" ("ip" character varying(20) NOT NULL, "title" character varying(150) NOT NULL, "lastActiveDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expDate" TIMESTAMP WITH TIME ZONE NOT NULL, "deviceId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_9107b59fc56d82e05451365e536" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`CREATE TYPE "public"."Likes_status_enum" AS ENUM('Like', 'Dislike', 'None')`);
        await queryRunner.query(`CREATE TABLE "Likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "targetId" character varying(100) NOT NULL, "status" "public"."Likes_status_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1c26def97ac3b554ea7c21be2c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Blogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" character varying(1000) NOT NULL, "websiteUrl" character varying(200) NOT NULL, "isMembership" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_007e2aca1eccf50f10c9176a71c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "shortDescription" character varying(300) NOT NULL, "content" character varying(2000) NOT NULL, "blogId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "commentsId" uuid, CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying(2000) NOT NULL, "postId" uuid NOT NULL, "commentatorId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_91e576c94d7d4f888c471fb43de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ConfirmationData" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "confirmationCode" character varying(100) NOT NULL, "confirmationCodeExpDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isConfirmed" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, CONSTRAINT "REL_3e13f300dcbd044b077fbae2b2" UNIQUE ("userId"), CONSTRAINT "PK_25d1c5a2300a767ca822fa278a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying(1000) NOT NULL, "answers" character varying(255) array NOT NULL, "isPublished" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f81bcc6305787ab7dd0d828e21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying(255) NOT NULL, "status" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "PK_e9ce77a9a6326d042fc833d63f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GameQuestions" ("id" SERIAL NOT NULL, "gameId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "PK_078c841669b86a5d8c5d744ebf2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Games_status_enum" AS ENUM('pending', 'active', 'finished')`);
        await queryRunner.query(`CREATE TABLE "Games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."Games_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "startedAt" TIMESTAMP WITH TIME ZONE, "finishedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1950492f583d31609c5e9fbbe12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "score" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "gameId" uuid NOT NULL, CONSTRAINT "PK_84d6935ba611485b4cc881776da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Sessions" ADD CONSTRAINT "FK_582c3cb0fcddddf078b33e316d3" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Likes" ADD CONSTRAINT "FK_eb14edaf42c147177b6f90ebf0c" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD CONSTRAINT "FK_3d48d13b4578bccfbda468b1c4c" FOREIGN KEY ("blogId") REFERENCES "Blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD CONSTRAINT "FK_a92ca2052a8a9880299e10600f9" FOREIGN KEY ("commentsId") REFERENCES "Comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_61e270402b5b6d8b8776bf17312" FOREIGN KEY ("commentatorId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ConfirmationData" ADD CONSTRAINT "FK_3e13f300dcbd044b077fbae2b2a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Answers" ADD CONSTRAINT "FK_db4e49981d2b7781c1882a02385" FOREIGN KEY ("playerId") REFERENCES "Players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Answers" ADD CONSTRAINT "FK_ff66967b8c32d6a22e32e5c4f66" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameQuestions" ADD CONSTRAINT "FK_241e6215d174f5c11190f073fe7" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameQuestions" ADD CONSTRAINT "FK_b10dd750196154a1950b9ea0a9f" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Players" ADD CONSTRAINT "FK_474e94f645a3ffbcb9d12f6c1ea" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Players" ADD CONSTRAINT "FK_d9164c6fbd8a90fdd391ecdb4bb" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Players" DROP CONSTRAINT "FK_d9164c6fbd8a90fdd391ecdb4bb"`);
        await queryRunner.query(`ALTER TABLE "Players" DROP CONSTRAINT "FK_474e94f645a3ffbcb9d12f6c1ea"`);
        await queryRunner.query(`ALTER TABLE "GameQuestions" DROP CONSTRAINT "FK_b10dd750196154a1950b9ea0a9f"`);
        await queryRunner.query(`ALTER TABLE "GameQuestions" DROP CONSTRAINT "FK_241e6215d174f5c11190f073fe7"`);
        await queryRunner.query(`ALTER TABLE "Answers" DROP CONSTRAINT "FK_ff66967b8c32d6a22e32e5c4f66"`);
        await queryRunner.query(`ALTER TABLE "Answers" DROP CONSTRAINT "FK_db4e49981d2b7781c1882a02385"`);
        await queryRunner.query(`ALTER TABLE "ConfirmationData" DROP CONSTRAINT "FK_3e13f300dcbd044b077fbae2b2a"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_61e270402b5b6d8b8776bf17312"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d"`);
        await queryRunner.query(`ALTER TABLE "Posts" DROP CONSTRAINT "FK_a92ca2052a8a9880299e10600f9"`);
        await queryRunner.query(`ALTER TABLE "Posts" DROP CONSTRAINT "FK_3d48d13b4578bccfbda468b1c4c"`);
        await queryRunner.query(`ALTER TABLE "Likes" DROP CONSTRAINT "FK_eb14edaf42c147177b6f90ebf0c"`);
        await queryRunner.query(`ALTER TABLE "Sessions" DROP CONSTRAINT "FK_582c3cb0fcddddf078b33e316d3"`);
        await queryRunner.query(`DROP TABLE "Players"`);
        await queryRunner.query(`DROP TABLE "Games"`);
        await queryRunner.query(`DROP TYPE "public"."Games_status_enum"`);
        await queryRunner.query(`DROP TABLE "GameQuestions"`);
        await queryRunner.query(`DROP TABLE "Answers"`);
        await queryRunner.query(`DROP TABLE "Questions"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "ConfirmationData"`);
        await queryRunner.query(`DROP TABLE "Comments"`);
        await queryRunner.query(`DROP TABLE "Posts"`);
        await queryRunner.query(`DROP TABLE "Blogs"`);
        await queryRunner.query(`DROP TABLE "Likes"`);
        await queryRunner.query(`DROP TYPE "public"."Likes_status_enum"`);
        await queryRunner.query(`DROP TABLE "Sessions"`);
    }

}
