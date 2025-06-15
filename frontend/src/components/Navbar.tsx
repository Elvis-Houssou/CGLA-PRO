import {  
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react"

export default function Navbar() {
    const name = "John Doe";
    const avatar = "/placeholder.svg"; // Replace with your avatar image URL  
    return (
        <nav className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between mb-8">
            <div className="flex items-center">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mx-4 bg-white border-white data-[orientation=vertical]:h-16  "/>
                <Breadcrumb className="text-white ">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="text-white">
                                Accueil
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-gray-900">Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center">
                <Icon
                    icon={'fluent:settings-24-filled'}
                    className="text-white"
                />
                <Avatar className="h-10 w-10 bg-gray-500 ml-4 border-2 border-green-700">
                    <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            
        </nav>
    )
}