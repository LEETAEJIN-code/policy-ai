from fastapi import APIRouter

from app.models.bookmark import BookmarkCreate
from app.models.policy import Policy
from app.services.bookmark_service import BookmarkService

router = APIRouter(
    prefix="/bookmarks",
    tags=["Bookmark"],
)

bookmark_service = BookmarkService()


@router.post("")
async def add_bookmark(
    bookmark: BookmarkCreate,
):
    created = bookmark_service.add(
        user=bookmark.user,
        policy_id=bookmark.policy_id,
    )

    return {
        "success": created,
        "message": (
            "북마크에 저장했습니다."
            if created
            else "이미 저장된 정책입니다."
        ),
    }


@router.delete("/{user}/{policy_id}")
async def delete_bookmark(
    user: str,
    policy_id: str,
):
    deleted = bookmark_service.remove(
        user=user,
        policy_id=policy_id,
    )

    return {
        "success": deleted,
    }


@router.get(
    "/{user}",
    response_model=list[Policy],
)
async def get_bookmarks(
    user: str,
):
    return bookmark_service.get_policies(
        user=user
    )


@router.get(
    "/{user}/{policy_id}/exists"
)
async def check_bookmark(
    user: str,
    policy_id: str,
):
    return {
        "bookmarked": bookmark_service.exists(
            user=user,
            policy_id=policy_id,
        ),
    }