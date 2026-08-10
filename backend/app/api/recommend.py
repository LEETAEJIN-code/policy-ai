import traceback

from fastapi import APIRouter, HTTPException

from app.models.user_profile import UserProfile
from app.services.policy_db_service import PolicyDbService
from app.services.policy_service import PolicyService


router = APIRouter()

policy_db_service = PolicyDbService()
policy_service = PolicyService()


@router.post("/recommend")
def recommend(user: UserProfile):
    try:
        policies = policy_db_service.get_all()

        return policy_service.recommend(
            policies=policies,
            user=user,
        )

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error