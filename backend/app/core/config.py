import os

from dotenv import load_dotenv


load_dotenv()


BIZINFO_API_KEY = os.getenv(
    "BIZINFO_API_KEY",
    "",
)

KSTARTUP_API_KEY = os.getenv(
    "KSTARTUP_API_KEY",
    "",
)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./policy_ai.db",
)