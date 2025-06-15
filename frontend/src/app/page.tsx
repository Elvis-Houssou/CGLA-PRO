import Image from "next/image";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button"
import LoginForm from "@/components/form/LoginForm";
import SignupForm from "@/components/form/SignUpForm";

export default function Home() {
  return (
    <div className="bg-background flex w-full items-center justify-center w-full">
      <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden">
        <div className="lg:w-1/2 flex flex-col items-center justify-center gap-4 my-auto mx-auto">
          <Image 
            src={"/images/logo.png"}
            alt="Logo"
            width={250}
            height={250}
            className="mb-4"
          />

          <Tabs defaultValue="Login" className="w-full flex items-center justify-center my-auto mx-autow-full lg:w-3/4 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <TabsList className="grid w-full grid-cols-2 bg-primary-hover shadow-md">
              <TabsTrigger value="Login">Connexion</TabsTrigger>
              <TabsTrigger value="Signup">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="Login" className="w-full">
              <LoginForm />
            </TabsContent>
            <TabsContent value="Signup" className="w-full">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:flex w-1/2 items-center justify-center">
          <Image
            src="/images/login_image.jpg"
            alt="Illustration"
            width={500}
            height={500}
            className="w-full h-screen bg-cover object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
