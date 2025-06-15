from fastapi import Depends, APIRouter, HTTPException, status
from app.models.offer import Offer, OfferCreate, OfferUpdate
from app.models.offer_benefit import OfferBenefit
from app.models.user import User
from app.dependencies import DbDependency, check_superadmin
from typing import Annotated

router = APIRouter(
    prefix="/offers",
    tags=['offers']
)

@router.get('/all', status_code=status.HTTP_200_OK)
async def get_all_offer(db: DbDependency, current_user: Annotated[User, Depends(check_superadmin)]):
    """Recupérer toutes les offres."""
    try:
        offers = db.query(Offer).all()
        if not offers:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No offers found"
            )
        return {
            "message": "Offers retrieved successfully",
            "offers": offers
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving offers: {str(e)}"
        )
    
@router.get("/{offer_id}", status_code=status.HTTP_200_OK)
async def get_one_offer(db: DbDependency, offer_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Recupérer une seule offre."""
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Offer not found'
            )
        return {
            "message": "Offer retrieved successfully",
            "data": offer
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving offers: {str(e)}"
        )

@router.post('/create', status_code=status.HTTP_201_CREATED)
async def create_offer(db: DbDependency, offer_data: OfferCreate, current_user: Annotated[User, Depends(check_superadmin)]):
    """Crée une nouvelle offre."""
    new_offer = Offer(
        name = offer_data.name,
        description = offer_data.description if offer_data.description else None,
        price = offer_data.price if offer_data.price else None,
    )

    try:
        db.add(new_offer)
        db.commit()
        db.refresh(new_offer)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'offre: {str(e)}"
        )
    
    return {
        "status": 201,
        "message": "Offer created successfully", 
        "data": new_offer
    }

@router.put('/update/{offer_id}', status_code=status.HTTP_200_OK)
async def update_offer(db: DbDependency, offer_id: int, offer_data: OfferUpdate, current_user: Annotated[User, Depends(check_superadmin)]):
    """Met à jour une offre existante."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    offer.name = offer_data.name if offer_data.name else offer.name
    offer.description = offer_data.description if offer_data.description else offer.description
    offer.price = offer_data.price if offer_data.price else offer.price
    try:
        db.commit()
        db.refresh(offer)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise a jour de l'offre: {str(e)}"
        )
    
    return {
        "message": "Offer updated successfully", 
        "data": offer
    }

@router.delete('/delete/{offer_id}', status_code=status.HTTP_200_OK)
async def delete_offer(db: DbDependency, offer_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Supprimer une offre existante."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )

    
    offer_benefit = db.query(OfferBenefit).filter(OfferBenefit.offer_id == offer_id).all()

    try:
        # Supprimer l'offre et ses associations
        for benefit in offer_benefit:
            db.delete(benefit)
        db.flush()  # S'assure que les suppressions sont prises en compte avant de supprimer l'offre
        db.delete(offer)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'offre: {str(e)}"
        )
    
    return {"message": "Offre deleted successfully"}

