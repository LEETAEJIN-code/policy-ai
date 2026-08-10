from app.services.policy_db_service import (
    PolicyDbService,
)
from app.services.policy_service import (
    PolicyService,
)
from app.services.sync_log_service import (
    SyncLogService,
)


# 애플리케이션 전체에서 공유하는 서비스 인스턴스
policy_service = PolicyService()
policy_db_service = PolicyDbService()
sync_log_service = SyncLogService()