import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.incident import (
    IncidentCreate,
    IncidentStatusUpdate,
    IncidentListResponse,
    IncidentSingleResponse,
)
from app.schemas.timeline_event import TimelineListResponse
from app.services.investigation_service import InvestigationService
from app.services.timeline_service import TimelineService

logger = logging.getLogger("threatlink.routes.incidents")

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.post(
    "",
    response_model=IncidentSingleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Incident",
    description="Creates a new security incident case."
)
def create_incident(data: IncidentCreate):
    try:
        inc = InvestigationService.create_incident(data)
        return IncidentSingleResponse(
            success=True,
            message="Incident created successfully",
            data=inc
        )
    except Exception as err:
        logger.error(f"Failed to create incident: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create incident."
        )

@router.get(
    "",
    response_model=IncidentListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Incidents List",
    description="Returns all security incidents."
)
def get_incidents():
    try:
        incidents = InvestigationService.get_incidents()
        return IncidentListResponse(
            success=True,
            message="Incidents retrieved successfully",
            data=incidents
        )
    except Exception as err:
        logger.error(f"Failed to fetch incidents: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve incidents."
        )

@router.get(
    "/{incident_id}",
    response_model=IncidentSingleResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Incident Details",
    description="Returns details for a single incident."
)
def get_incident(incident_id: str):
    inc = InvestigationService.get_incident(incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {incident_id} not found."
        )
    return IncidentSingleResponse(
        success=True,
        message="Incident retrieved successfully",
        data=inc
    )

@router.patch(
    "/{incident_id}/status",
    response_model=IncidentSingleResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Incident Status",
    description="Updates the status of an incident (OPEN, IN_PROGRESS, RESOLVED, CLOSED)."
)
def update_incident_status(incident_id: str, data: IncidentStatusUpdate):
    try:
        updated = InvestigationService.update_incident_status(incident_id, data.status)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident {incident_id} not found."
            )
        return IncidentSingleResponse(
            success=True,
            message="Incident status updated successfully",
            data=updated
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as err:
        logger.error(f"Failed to update status: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update incident status."
        )

@router.get(
    "/{incident_id}/timeline",
    response_model=TimelineListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Incident Timeline",
    description="Returns chronological sequence of timeline events for the incident (oldest first)."
)
def get_incident_timeline(incident_id: str):
    try:
        events = TimelineService.get_incident_timeline(incident_id)
        if not events:
            events = TimelineService.build_incident_timeline(incident_id)
        return TimelineListResponse(
            success=True,
            message="Incident timeline retrieved successfully",
            data=events
        )
    except Exception as err:
        logger.error(f"Failed to get timeline: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve timeline."
        )

@router.get(
    "/{incident_id}/report",
    status_code=status.HTTP_200_OK,
    summary="Get Incident Executive Report Payload",
    description="Generates executive forensic report data payload with SHA-256 hashes & blockchain verification info."
)
def get_incident_report(incident_id: str):
    inc = InvestigationService.get_incident(incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {incident_id} not found."
        )
    
    from app.services.evidence_service import EvidenceService
    from app.services.report_service import report_service
    
    evidence_list = EvidenceService.get_incident_evidence(incident_id)
    inc_dict = inc.model_dump() if hasattr(inc, "model_dump") else dict(inc)
    evidence_dicts = [e.model_dump() if hasattr(e, "model_dump") else dict(e) for e in evidence_list]
    
    report_data = report_service.generate_incident_report_data(inc_dict, evidence_dicts)
    return {
        "success": True,
        "message": "Incident executive report generated successfully",
        "data": report_data
    }

