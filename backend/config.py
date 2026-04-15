from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Configuration management. 
    Pydantic automatically reads from the .env file and performs type validation.
    """
    postgres_host: str
    postgres_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str
    
    kafka_bootstrap_servers: str
    
    redis_host: str
    redis_port: int
    
    # Specify the env file location
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
# Instantiate the settings object to be imported by other modules
settings = Settings()