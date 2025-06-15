from fastapi import Depends, APIRouter, HTTPException, status
from app.models.benefit import Benefit, BenefitCreate, BenefitUpdate
from app.models.user import User
from app.dependencies import DbDependency, check_superadmin
from typing import Annotated

router = APIRouter(
    prefix="/benefits",
    tags=['benefits']
)

@router.get('/all', status_code=status.HTTP_200_OK)
async def get_all_benefits(db: DbDependency, current_user: Annotated[User, Depends(check_superadmin)]):
    """Recupérer tous les avantages."""
    try:
        benefits = db.query(Benefit).all()
        if not benefits:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No benefits found"
            )
        return {
            "message": "Benefits retrieved successfully",
            "benefits": benefits
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving offers: {str(e)}"
        )
    
@router.get('/{benefit_id}', status_code=status.HTTP_200_OK)
async def get_one_benefit(db: DbDependency, benefit_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Recupérer un seul avantage."""
    try:
        benefit = db.query(Benefit).filter(Benefit.id == benefit_id).first()
        if not benefit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No benefit found"
            )
        return {
            "message": "Benefits retrieved successfully",
            "data": benefit
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving offers: {str(e)}"
        )
    
@router.post('/create', status_code=status.HTTP_201_CREATED)
async def create_benefit(db: DbDependency, benefit_data: BenefitCreate, current_user: Annotated[User, Depends(check_superadmin)]):
    """Créer un avantage."""
    new_benefit = Benefit(
        name = benefit_data.name if benefit_data.name else None,
        description = benefit_data.description if benefit_data.description else None,
        image = benefit_data.image if benefit_data.image else None
    )

    try:
        db.add(new_benefit)
        db.commit()
        db.refresh(new_benefit)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'avantage: {str(e)}"
        )
    
    return {
        "message": "Benefit created successfully", 
        "data": new_benefit
    }

@router.put('/update/{benefit_id}', status_code=status.HTTP_200_OK)
async def update_benefit(db: DbDependency, benefit_data: BenefitUpdate, benefit_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Met a jour un avantage existant."""
    benefit = db.query(Benefit).filter(Benefit.id == benefit_id).first()
    if not benefit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No benefit found"
        )
    
    benefit.name = benefit_data.name if benefit_data.name else benefit.name,
    benefit.description = benefit_data.description if benefit_data.description else benefit.description,
    benefit.image = benefit_data.image if benefit_data.image else benefit.image
    try:
        db.commit()
        db.refresh(benefit)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise a jour de l'avantage: {str(e)}"
        )
        
    return {
        "message": "Benefit updated successfully", 
        "data": benefit
    }

@router.delete('/delete/{benefit_id}', status_code=status.HTTP_200_OK)
async def delete_benefit(db: DbDependency, benefit_id: int, current_user: Annotated[User, Depends(check_superadmin)]):
    """Supprime un avantage existant."""
    benefit = db.query(Benefit).filter(Benefit.id == benefit_id).first()
    if not benefit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No benefit found"
        )
    
    try:
        db.delete(benefit)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'avantage: {str(e)}"
        )
    
    return {"message": "Offre deleted successfully"}
        
