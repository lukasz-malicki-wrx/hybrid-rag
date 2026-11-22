from fastapi import APIRouter

from ...schemas.settings import SettingsIn, SettingsOut
from ..deps import SettingsServiceDep

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsOut)
def get_settings(settings: SettingsServiceDep):
    return settings.get()


@router.put("", response_model=SettingsOut)
def update_settings(body: SettingsIn, settings: SettingsServiceDep):
    """Each change is kept as a new version; answers record the version they used."""
    return settings.update(body.personal_context)
