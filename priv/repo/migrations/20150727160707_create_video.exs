defmodule HelloPhoenix.Repo.Migrations.CreateVideo do
  use Ecto.Migration

  def change do
    create table(:videos) do
      add :name, :string
      add :desc, :string

      timestamps
    end

  end
end
