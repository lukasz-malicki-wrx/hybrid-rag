from uuid import UUID

from fastapi import APIRouter, Response

from ...schemas.group import GroupDeleted, GroupIn, GroupOut
from ..deps import GroupServiceDep

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("", response_model=list[GroupOut])
def list_groups(groups: GroupServiceDep):
    return groups.list()


@router.post("", status_code=201, response_model=GroupOut, responses={409: {}})
def create_group(body: GroupIn, groups: GroupServiceDep):
    return groups.create(body.name)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: UUID, groups: GroupServiceDep):
    """conversation_count is what a client shows before deleting: all of them go too."""
    return groups.get(group_id)


@router.patch("/{group_id}", response_model=GroupOut, responses={409: {}})
def rename_group(group_id: UUID, body: GroupIn, groups: GroupServiceDep):
    return groups.rename(group_id, body.name)


@router.delete("/{group_id}", response_model=GroupDeleted)
def delete_group(group_id: UUID, groups: GroupServiceDep):
    """Deletes the group and all its conversations. Documents stay in the library."""
    return groups.delete(group_id)


@router.put("/{group_id}/documents/{document_id}", status_code=204)
def add_document(group_id: UUID, document_id: UUID, groups: GroupServiceDep):
    groups.add_document(group_id, document_id)
    return Response(status_code=204)


@router.delete("/{group_id}/documents/{document_id}", status_code=204)
def remove_document(group_id: UUID, document_id: UUID, groups: GroupServiceDep):
    groups.remove_document(group_id, document_id)
    return Response(status_code=204)
