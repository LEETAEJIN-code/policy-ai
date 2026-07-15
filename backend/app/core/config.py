import os

from dotenv import load_dotenv

load_dotenv()


BIZINFO_API_KEY = os.getenv(
    "BIZINFO_API_KEY",
    ""
)