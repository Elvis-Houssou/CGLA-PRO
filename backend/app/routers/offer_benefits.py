from fastapi import Depends, APIRouter, HTTPException, status
from app.models.benefit import Benefit
from app.models.offer import Offer
from app.models.offer_benefit import OfferBenefit
from app.models.user import User
from app.dependencies import DbDependency, check_superadmin
from typing import Annotated, List
from pydantic import BaseModel

router = APIRouter(
    prefix="/offer_benefits",
    tags=['offer_benefits']
)

class RemoveBenefitsFromOffer(BaseModel):
    offer_id: int
    benefit_ids: List[int]

class OfferBenefitsResponse(BaseModel):
    message: str
    data: dict

@router.get('/{offer_id}', status_code=status.HTTP_200_OK)
async def get_benefits_for_offer(db: DbDependency, offer_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Retrieve all benefits associated with a specific offer."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Récupérer les avantages associés via la table offer_benefit
    try:
        benefits = (
            db.query(Benefit)
            .join(OfferBenefit, OfferBenefit.benefit_id == Benefit.id)
            .filter(OfferBenefit.offer_id == offer_id)
            .all()
        )
        return {
            "message": "Benefits retrieved successfully",
            "data": {
                "offer_id": offer_id,
                "benefits": benefits
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving benefits for offer: {str(e)}"
        )


@router.post('/create/{offer_id}', status_code=status.HTTP_201_CREATED)
async def assign_benefits_to_offer(db: DbDependency, offer_id: int, assignment_data: List[int], current_user: Annotated[User, Depends(check_superadmin)]):
    """Assigner un ou plusieurs avantages a une offre."""
    # Vérifier que l'offre existe
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Vérifier que tous les avantages existent et éviter les doublons
    for benefit_id in assignment_data:
        benefit = db.query(Benefit).filter(Benefit.id == benefit_id).first()
        if not benefit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Benefit with id {benefit_id} not found"
            )
        
        # Vérifier si l'association existe déjà
        existing = db.query(OfferBenefit).filter(
            OfferBenefit.offer_id == offer_id,
            OfferBenefit.benefit_id == benefit_id
        ).first()
        if existing:
            continue  # Ignorer si déjà associé

        # Créer l'association dans offer_benefit
        offer_benefit = OfferBenefit(
            offer_id=offer_id, 
            benefit_id=benefit_id
        )
        db.add(offer_benefit)

    # Valider les modifications dans la base de données
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning benefits to offer: {str(e)}"
        )
    
    return {
        "message": "Benefits assigned to offer successfully",
        "data": {
            "offer_id": offer_id,
            "benefit_ids": assignment_data
        }
    }

@router.delete('/remove', status_code=status.HTTP_200_OK, response_model=OfferBenefitsResponse)
async def remove_benefits_from_offer(db: DbDependency, removal_data: RemoveBenefitsFromOffer, current_user: Annotated[User, Depends(check_superadmin)]):
    """Supprimer un ou plusieurs avantage dans une offre."""
    offer = db.query(Offer).filter(Offer.id == removal_data.offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )

    # Supprimer les associations
    deleted_count = 0
    for benefit_id in removal_data.benefit_ids:
        # Vérifier si l'association existe
        association = db.query(OfferBenefit).filter(
            OfferBenefit.offer_id == removal_data.offer_id,
            OfferBenefit.benefit_id == benefit_id
        ).first()
        if not association:
            continue  # Ignorer si l'association n'existe pas
        
        # Supprimer l'association
        db.delete(association)
        deleted_count += 1
    
    # Si aucune association n'a été trouvée, signaler un avertissement
    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No matching benefit associations found for the offer"
        )
    
    # Valider les modifications
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing benefits from offer: {str(e)}"
        )
    
    return {
        "message": "Benefits removed from offer successfully",
        "data": {
            "offer_id": removal_data.offer_id,
            "benefit_ids": removal_data.benefit_ids
        }
    }
