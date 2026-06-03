from pydantic import BaseModel, Field

class M(BaseModel):
    id: str = Field(alias='_id')

print(M(**{'_id': '123'}))
