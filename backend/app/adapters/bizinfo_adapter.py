from app.models.policy import Policy


class BizInfoAdapter:

    def normalize(
        self,
        item: dict
    ) -> Policy:

        return Policy(

            id=str(item.get("id", "")),

            source="기업마당",

            title=item.get("title", ""),

            organization=item.get(
                "organization",
                ""
            ),

            description=item.get(
                "description",
                ""
            ),

            detail_url=item.get(
                "detail_url",
                ""
            ),

            region=[],

            target=[],

            support_types=[],

            age_min=None,

            age_max=None,

            start_date=None,

            end_date=None,

            required_documents=[],

            keywords=[]
        )