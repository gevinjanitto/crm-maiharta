from pydantic import BaseModel, Field, ConfigDict, EmailStr, model_validator
from typing import Literal, Optional
from datetime import date

class Input(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
class Record(BaseModel):
    model_config = ConfigDict(extra='allow')
    id: str
class Login(Input):
    username: str
    password: str
    captcha_id: str
    captcha_answer: str
    remember: bool = False
class PasswordChange(Input):
    current_password: str
    new_password: str = Field(min_length=10, max_length=72)
class ClientInput(Input):
    name: str = Field(min_length=2, max_length=150)
    contact: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str = ''
    industry: str = ''
    address: str = ''
class UserInput(Input):
    name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_.-]+$')
    email: EmailStr
    password: str = Field(min_length=10, max_length=72)
    role: Literal['Admin','Admin Project','Developer','Accounting','Client']
    client_id: str = ''
class UserUpdate(Input):
    role: Optional[Literal['Admin','Admin Project','Developer','Accounting','Client']] = None
    active: Optional[bool] = None
    client_id: Optional[str] = None
    new_password: Optional[str] = Field(default=None, min_length=10, max_length=72)
class ProjectInput(Input):
    name: str = Field(min_length=3, max_length=150)
    client_id: str
    description: str = ''
    category: str = 'Web Development'
    type: Literal['Kecil','Besar'] = 'Besar'
    value: float = Field(default=0, ge=0)
    start_date: date
    due_date: date
    assigned_to: list[str] = []
    internal_notes: str = ''
    @model_validator(mode='after')
    def check_dates(self):
        if self.due_date < self.start_date: raise ValueError('Deadline harus setelah tanggal mulai.')
        return self
class StatusInput(Input):
    status: str
    note: str = Field(default='', max_length=1000)
class FeatureInput(Input):
    name: str = Field(min_length=2, max_length=150)
    category: Literal['Frontend','Backend','UI/UX','Lainnya'] = 'Frontend'
    price: float = Field(default=0, ge=0)
    assigned_to: str = ''
    due_date: Optional[date] = None
class ProgressInput(Input):
    status: Literal['Belum dimulai','Dikerjakan','Selesai']
class CostInput(Input):
    development_cost: float = Field(ge=0)
    server_cost: float = Field(ge=0)
class WorkInput(Input):
    title: str = Field(min_length=3, max_length=200)
    description: str = ''
    kind: str
    assigned_to: str = ''
    due_date: date
    estimate: float = Field(default=0, ge=0)
    subtasks: list[str] = []
TaskStatus = Literal['Belum Mulai','Dikerjakan','Testing','Revisi','Selesai']
ServerStage = Literal['Belum Naik','Dev Server','Production']
Priority = Literal['Rendah','Sedang','Tinggi','Mendesak']
class TaskInput(Input):
    title: str = Field(min_length=2, max_length=200)
    description: str = ''
    status: TaskStatus = 'Belum Mulai'
    server: ServerStage = 'Belum Naik'
    assigned_to: str = ''
    due_date: Optional[date] = None
    priority: Priority = 'Sedang'
    subtasks: list[str] = []
class TaskUpdate(Input):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    server: Optional[ServerStage] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Priority] = None
class SubtaskInput(Input):
    title: str = Field(min_length=1, max_length=200)
    assigned_to: str = ''
class SubtaskUpdate(Input):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    done: Optional[bool] = None
    assigned_to: Optional[str] = None
CostGroup = Literal['Development','Server','Lainnya']
class CostTypeInput(Input):
    name: str = Field(min_length=2, max_length=100)
    group: CostGroup = 'Lainnya'
    description: str = ''
class CostTypeUpdate(Input):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    group: Optional[CostGroup] = None
    description: Optional[str] = None
    active: Optional[bool] = None
class ExpenseInput(Input):
    cost_type_id: str
    amount: float = Field(gt=0)
    date: date
    note: str = ''
class WorkUpdate(Input):
    status: Literal['Terbuka','Dikerjakan','Selesai']
    approved: bool = False
class DeployInput(Input):
    environment: Literal['Development','Production']
    url: str = Field(pattern=r'^https?://[^\s]+$')
    version: str = Field(min_length=1, max_length=50)
    notes: str = ''
class TicketInput(Input):
    project_id: str
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    category: Literal['Bug / Problem','Maintenance','Change Request','Out of Scope'] = 'Bug / Problem'
    priority: Literal['Rendah','Sedang','Tinggi','Mendesak'] = 'Sedang'
class TicketUpdate(Input):
    status: str
    category: Optional[Literal['Bug / Problem','Maintenance','Change Request','Out of Scope']] = None
    assigned_to: Optional[str] = None
    estimate: Optional[float] = Field(default=None, ge=0)
class CommentInput(Input):
    message: str = Field(min_length=1, max_length=3000)
    internal: bool = False