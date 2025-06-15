import Image from "next/image";
import { Icon } from "@iconify/react";
import { CheckCircle, Info } from "lucide-react";

import { BenefitProps } from "@/props";


import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function BenefitItem ({ benefit }: { benefit: BenefitProps }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100} >
              <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-help group">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                        {benefit.icon ? (
                        <Icon icon={benefit.icon || '/images/placeholder.jpg'} className="h-4 w-4 text-green-600" />
                        ) : (
                          <Image 
                            src="/images/placeholder.jpg"
                            alt={benefit.name}
                            width={50}
                            height={50}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 line-clamp-2 group-hover:text-slate-900 transition-colors duration-200">
                        {benefit.name}
                        </span>
                    </div>
                    <Info className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-0.5" />
                  </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-primary-hover text-white">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{benefit.name}</p>
                    <p className="text-xs  leading-relaxed">{benefit.description}</p>
                  </div>
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export function BenefitsDialog(
  { benefits, offerName }: { benefits: BenefitProps[]; offerName: string }
) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto">
          <span className="text-xs font-medium">Voir tous les avantages</span>
          <Icon icon="material-symbols:arrow-outward" className="h-3 w-3 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Avantages inclus - {offerName}
          </DialogTitle>
          <DialogDescription>
            Découvrez en détail tous les avantages et services inclus dans cette offre.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {benefits.map((benefit: BenefitProps) => (
            <div
              key={benefit.id}
              className="flex gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Icon icon={benefit.icon || ''} className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-slate-900">{benefit.name}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}