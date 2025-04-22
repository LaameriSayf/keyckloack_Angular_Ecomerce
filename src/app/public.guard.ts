import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';  // Votre service d'authentification basé sur Keycloak

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    // Si l'utilisateur est authentifié, on autorise l'accès
  

    // Sinon, on redirige l'utilisateur vers la page de connexion
    return true;
  }
}
