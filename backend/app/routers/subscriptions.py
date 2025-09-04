from fastapi import Depends, APIRouter, HTTPException, status
from datetime import datetime, timedelta
from app.models.subscription import Subscription, SubscriptionCreate, SubscriptionUpdate, Status
from app.models.offer import Offer
from app.models.user import User, Role
from app.dependencies import DbDependency, check_subscription_status, check_advantage, get_advantage_checker, get_current_user
from typing import Annotated

router = APIRouter(
    prefix="/subscriptions",
    tags=['subscriptions']
)


    
@router.get('/status', status_code=status.HTTP_200_OK)
async def get_subscription_status(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Récupère l'état de l'abonnement de l'utilisateur actuel."""
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user['id'], Subscription.status == Status.ACTIVE).first()

    if not subscription:
        return {
            "status": "no_active_subscription"
        }
    
    status = check_subscription_status(subscription)
    return {
        "status": status
    }

@router.post('/renew', status_code=status.HTTP_200_OK)
async def renew_subscription(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Renouvelle l'abonnement existant de l'utilisateur."""
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user['id'], Subscription.status == Status.ACTIVE).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun abonnement actif trouvé"
        )
    
    if subscription.end_date >= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'abonnement est encore actif"
        )
    
    # Prolongation de 30 jours (exemple)
    subscription.end_date = datetime.now() + timedelta(days=30)
    subscription.status = Status.ACTIVE
    try:
        db.commit()
        db.refresh(subscription)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'abonnement: {str(e)}"
        )
    
    return {
        "message": "Abonnement rénouveler avec succès",
        "data": subscription
    }

@router.post('/subscribe', status_code=status.HTTP_201_CREATED)
async def create_subscription(db: DbDependency, subscription_data: SubscriptionCreate, current_user: Annotated[User, Depends(get_current_user)]):
    """Créer un abonnement en liant un utilisateur a une offre."""
     # Vérifier que l'utilisateur est un propriétaire de lavage
    if current_user['role'] != Role.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les propriétaire de lavage peuvent s'abonner à une offre"
        )
    
    # Vérifier si l'utilisateur a déjà un abonnement actif
    existing_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user['id'],
        Subscription.status == Status.ACTIVE
    ).first()
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà un abonnement actif. Veuillez le renouveler ou le résilier avant de souscrire à une nouvelle offre."
        )
    
    # Vérifier que l'offre existe
    offer = db.query(Offer).filter(Offer.id == subscription_data.offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre non trouvée"
        )
    
    # Créer le nouvel abonnement
    new_subscription = Subscription(
        user_id = current_user['id'],
        offer_id = subscription_data.offer_id,
        status=Status.ACTIVE,  # ou ACTIVE, selon la logique
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=30)
    )

    try:
        db.add(new_subscription)
        db.commit()
        db.refresh(new_subscription)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'abonnement: {str(e)}"
        )
    
    return {
        "message": "Abonnement créé avec succès",
        "data": new_subscription
    }
