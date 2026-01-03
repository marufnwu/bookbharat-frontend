'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { addressApi, shippingApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin } from 'lucide-react'

const addressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsapp_number: z.string().min(10, 'WhatsApp number must be at least 10 digits'),
  village_city_area: z.string().min(1, 'Village/City/Area is required'),
  house_number: z.string().optional(),
  landmark: z.string().min(1, 'Landmark is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  zila: z.string().min(1, 'Zila is required'),
  state: z.string().min(1, 'State is required'),
  post_name: z.string().min(1, 'Post name is required'),
  country: z.string().default('India'),
})

interface Address {
  id: number
  type: string
  first_name: string
  last_name: string
  phone: string
  whatsapp_number: string
  village_city_area: string
  house_number?: string
  landmark: string
  pincode: string
  zila: string
  state: string
  post_name: string
  country: string
  is_default: boolean
}

interface PincodeDetails {
  success: boolean
  serviceable: boolean
  pincode: string
  zone_info?: {
    city: string
    district: string
    state: string
    region: string
    office_name: string
    delivery_status: string
  }
  estimated_delivery?: string
  free_shipping_threshold?: number
  cod_available?: boolean
  message?: string
}

interface AddressManagerProps {
  onAddressSelect: (address: Address | null) => void
  selectedAddress?: Address | null
}

export default function AddressManager({ onAddressSelect, selectedAddress }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: 'shipping',
      first_name: '',
      last_name: '',
      phone: '',
      whatsapp_number: '',
      village_city_area: '',
      house_number: '',
      landmark: '',
      pincode: '',
      zila: '',
      state: '',
      post_name: '',
      country: 'India',
    },
  })

  // Watch pincode field for automatic validation
  const watchedPincode = form.watch('pincode')

  // Clear pincode errors when user starts typing a new pincode
  useEffect(() => {
    if (watchedPincode && watchedPincode.length < 6) {
      form.clearErrors('pincode')
    }
  }, [watchedPincode, form])

  // Validate pincode and fetch location details
  const validatePincode = async (pincode: string) => {
    if (pincode.length !== 6) return

    setPincodeLoading(true)
    try {
      const data: PincodeDetails = await shippingApi.checkPincode(pincode)
      logger.log('Pincode validation response:', data)
      
      if (data.success && data.serviceable && data.zone_info?.city) {
        // Clear any previous pincode errors
        form.clearErrors('pincode')

        // Auto-fill city, state, and post name with proper form update
        form.setValue('zila', data.zone_info?.district || data.zone_info?.city, { shouldValidate: true, shouldDirty: true })
        form.setValue('state', data.zone_info.state, { shouldValidate: true, shouldDirty: true })
        form.setValue('post_name', data.zone_info?.office_name || data.zone_info?.city, { shouldValidate: true, shouldDirty: true })

        // Trigger form re-render to ensure UI updates
        form.trigger(['zila', 'state', 'post_name'])

        toast({
          title: "Pincode validated",
          description: `Delivery available to ${data.zone_info?.district || data.zone_info?.city}, ${data.zone_info.state}`,
        })
      } else {
        form.setError('pincode', {
          type: 'manual',
          message: data.message || 'This pincode is not serviceable'
        })
        
        toast({
          title: "Invalid pincode",
          description: data.message || 'This pincode is not serviceable',
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Pincode validation error:', error)
      console.error('Error message:', error.message)
      
      // Check if the error contains the API response message
      const errorMessage = error.message || 'Unable to validate pincode. Please check your connection.'
      
      form.setError('pincode', {
        type: 'manual',
        message: errorMessage
      })
      
      toast({
        title: "Pincode validation failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setPincodeLoading(false)
    }
  }

  // Debounced pincode validation
  useEffect(() => {
    if (watchedPincode && watchedPincode.length === 6) {
      const timer = setTimeout(() => {
        validatePincode(watchedPincode)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [watchedPincode])

  useEffect(() => {
    if (editingAddress) {
      const addressData = {
        type: editingAddress.type as 'billing' | 'shipping',
        first_name: editingAddress.first_name,
        last_name: editingAddress.last_name,
        phone: editingAddress.phone,
        whatsapp_number: editingAddress.whatsapp_number,
        village_city_area: editingAddress.village_city_area,
        house_number: editingAddress.house_number || '',
        landmark: editingAddress.landmark,
        pincode: editingAddress.pincode,
        zila: editingAddress.zila,
        state: editingAddress.state,
        post_name: editingAddress.post_name,
        country: editingAddress.country,
      }
      
      form.reset(addressData)
      
      // Trigger pincode validation if pincode is valid
      if (editingAddress.pincode && editingAddress.pincode.length === 6) {
        // Small delay to ensure form is properly reset
        setTimeout(() => {
          validatePincode(editingAddress.pincode)
        }, 100)
      }
    } else {
      form.reset({
        type: 'shipping',
        first_name: '',
        last_name: '',
        phone: '',
        whatsapp_number: '',
        village_city_area: '',
        house_number: '',
        landmark: '',
        pincode: '',
        zila: '',
        state: '',
        post_name: '',
        country: 'India',
      })
    }
  }, [editingAddress])

  const fetchAddresses = async () => {
    try {
      const response = await addressApi.getAddresses()
      const data = response.data || []
      setAddresses(data)
      
      // Auto-select default address if none selected
      if (!selectedAddress) {
        const defaultAddress = data.find(addr => addr.is_default)
        if (defaultAddress) {
          onAddressSelect(defaultAddress)
        }
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to load addresses"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleSubmit = async (values: z.infer<typeof addressSchema>) => {
    try {
      if (editingAddress) {
        await addressApi.updateAddress(editingAddress.id, values)
        toast({
          title: "Success",
          description: "Address updated successfully",
        })
      } else {
        await addressApi.createAddress(values)
        toast({
          title: "Success",
          description: "Address added successfully",
        })
      }
      
      await fetchAddresses()
      setIsDialogOpen(false)
      setEditingAddress(null)
    } catch (error: any) {
      console.error('Error saving address:', error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to save address"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!editingAddress) return
    
    try {
      await addressApi.deleteAddress(editingAddress.id)
      toast({
        title: "Success",
        description: "Address deleted successfully",
      })
      
      await fetchAddresses()
      
      // Clear selection if deleted address was selected
      if (selectedAddress?.id === editingAddress.id) {
        onAddressSelect(null)
      }
      
      setIsDeleteDialogOpen(false)
      setEditingAddress(null)
    } catch (error: any) {
      console.error('Error deleting address:', error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete address"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleSetDefault = async (addressId: number) => {
    try {
      await addressApi.setDefault(addressId)
      toast({
        title: "Success",
        description: "Default address updated",
      })
      await fetchAddresses()
    } catch (error: any) {
      console.error('Error setting default address:', error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to update default address"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (address?: Address) => {
    setEditingAddress(address || null)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (address: Address) => {
    setEditingAddress(address)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center items-center py-8">Loading addresses...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Address
          </div>
          {addresses.length > 0 && (
            <Button onClick={() => openEditDialog()}>Add New Address</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      {addresses.length === 0 ? (
        <div className="relative min-h-[450px] w-full">
          {/* Blurred Background Content */}
          <div className="absolute inset-0 blur-sm pointer-events-none opacity-50 select-none overflow-hidden">
             <div className="grid gap-4">
               {[1, 2, 3, 4].map((i) => (
                 <Card key={i} className="bg-muted/20 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 w-full">
                           <div className="h-5 bg-muted-foreground/20 rounded w-1/3"></div>
                           <div className="space-y-1">
                              <div className="h-4 bg-muted-foreground/10 rounded w-2/3"></div>
                              <div className="h-4 bg-muted-foreground/10 rounded w-1/2"></div>
                              <div className="h-4 bg-muted-foreground/10 rounded w-1/4"></div>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                 </Card>
               ))}
             </div>
          </div>

          {/* Centered Add Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
             {/* Glowing Wrapper */}
             <div className="relative max-w-sm w-full mx-auto group">
               {/* Animated Outer Glow/Shadow */}
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/80 via-accent/80 to-primary/80 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
               
               <div className="relative text-center p-8 rounded-xl bg-background/90 backdrop-blur-md border border-primary/10 shadow-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
                  {/* Decorative background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <MapPin className="h-8 w-8 text-primary animate-[bounce_3s_infinite]" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Where should we deliver?
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      No addresses found. Add your first address to continue.
                    </p>
                    
                    <Button 
                      onClick={() => openEditDialog()} 
                      size="lg" 
                      className="w-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Add New Address
                      </span>
                    </Button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-colors ${
                selectedAddress?.id === address.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {address.first_name} {address.last_name}
                      </h4>
                      {address.is_default && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          Default
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full capitalize">
                        {address.type}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{address.village_city_area}</p>
                      {address.house_number && <p>House: {address.house_number}</p>}
                      <p>Landmark: {address.landmark}</p>
                      <p>{address.post_name}, {address.zila}, {address.state} - {address.pincode}</p>
                      <div className="flex gap-4 mt-2 pt-2 border-t border-border/50">
                        {address.phone && (
                          <span className="flex items-center text-xs">
                             Phone: {address.phone}
                          </span>
                        )}
                        {address.whatsapp_number && (
                          <span className="flex items-center text-xs">
                             WA: {address.whatsapp_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 ml-4">
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetDefault(address.id)
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(address)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteDialog(address)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  {...form.register('first_name')}
                  placeholder="Enter first name"
                />
                {form.formState.errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  {...form.register('last_name')}
                  placeholder="Enter last name"
                />
                {form.formState.errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  {...form.register('phone')}
                  placeholder="Enter phone number"
                  type="tel"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                <Input
                  {...form.register('whatsapp_number')}
                  placeholder="Enter WhatsApp number"
                  type="tel"
                />
                {form.formState.errors.whatsapp_number && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.whatsapp_number.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="village_city_area">Village/City/Area *</Label>
              <Input
                {...form.register('village_city_area')}
                placeholder="Enter village, city or area"
              />
              {form.formState.errors.village_city_area && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.village_city_area.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="house_number">House Number</Label>
                <Input
                  {...form.register('house_number')}
                  placeholder="Enter house number (optional)"
                />
              </div>

              <div>
                <Label htmlFor="landmark">Landmark *</Label>
                <Input
                  {...form.register('landmark')}
                  placeholder="Enter nearby landmark"
                />
                {form.formState.errors.landmark && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.landmark.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <div className="relative">
                  <Input
                    {...form.register('pincode')}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {pincodeLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
                {form.formState.errors.pincode && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.pincode.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="zila">District *</Label>
                <Input
                  {...form.register('zila')}
                  placeholder="Enter zila/district"
                  readOnly
                  className="bg-gray-50"
                />
                {form.formState.errors.zila && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.zila.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  {...form.register('state')}
                  placeholder="Enter state"
                  readOnly
                  className="bg-gray-50"
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="post_name">Post Name *</Label>
              <Input
                {...form.register('post_name')}
                placeholder="Post name (auto-filled from pincode)"
                readOnly
                className="bg-gray-50"
              />
              {form.formState.errors.post_name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.post_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Address Type</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => {
                  return (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="shipping">
                      <SelectTrigger>
                        <SelectValue placeholder="Select address type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={pincodeLoading}>
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </CardContent>
    </Card>
  )
}