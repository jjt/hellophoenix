defmodule HelloPhoenix.Repo.Migrations.UserVideoReference do
  use Ecto.Migration

  def change do
    alter table(:videos) do
      add :user_id, references(:users)
    end
  end
end
