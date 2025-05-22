import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("friend_relationships", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    friend_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "pending",
      check: "status IN ('pending', 'accepted', 'rejected', 'blocked')",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.addConstraint("friend_relationships", "unique_friendship", {
    unique: ["user_id", "friend_id"],
  });

  pgm.addConstraint("friend_relationships", "prevent_self_friendship", {
    check: "user_id != friend_id",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("friend_relationships");
}