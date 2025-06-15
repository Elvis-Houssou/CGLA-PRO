import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpForm() {
    return (
        <Card className="bg-primary-hover border-none shadow-md">
            <CardHeader className="text-background">
                <CardTitle>Inscription</CardTitle>
                <CardDescription>Créez un compte pour continuer</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div className="py-2">
                        <Label htmlFor="email" className="py-2">Email</Label>
                        <Input type="email" id="email" required/>
                    </div>
                    <div className="py-2">
                        <Label htmlFor="password" className="py-2">Mot de passe</Label>
                        <Input type="password" id="password" required/>
                    </div>
                    <div className="py-2">
                        <Label htmlFor="confirmPassword" className="py-2">Confirmer votre mot de passe</Label>
                        <Input type="password" id="password" required/>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button 
                    type="submit" 
                    variant={'animated'}
                >S&apos;inscrire</Button>
            </CardFooter>
        </Card>
    )
}