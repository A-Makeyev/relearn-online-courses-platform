import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'


function FormControls({ formControls = [], formData, setFormData }) {
  const [visibleFields, setVisibleFields] = useState({})

  function updateField(name, value) {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function renderComponentByType(item) {
    let element = null
    const currentControlItemValue = formData[item.name] || ''

    switch (item.componentType) {
      case 'input':
        element = item.type === 'password' ? (
            <div className="relative">
                <Input
                    id={item.name}
                    name={item.name}
                    type={visibleFields[item.name] ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={item.placeholder}
                    value={currentControlItemValue}
                    className="pr-11"
                    onChange={(event) => updateField(item.name, event.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setVisibleFields(previous => ({
                        ...previous,
                        [item.name]: !previous[item.name]
                    }))}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={visibleFields[item.name] ? 'Hide password' : 'Show password'}
                >
                    {visibleFields[item.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        ) : (
            <Input
                id={item.name}
                name={item.name}
                type={item.type}
                autoComplete={item.name === 'email' ? 'email' : 'off'}
                placeholder={item.placeholder}
                value={currentControlItemValue}
                onChange={(event) => updateField(item.name, event.target.value)}
            />
        )
        break

      case 'select':
        element = (
            <Select
                value={currentControlItemValue}
                onValueChange={(value) => updateField(item.name, value)}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={item.placeholder} />
                </SelectTrigger>
                <SelectContent>
                    { item.options && item.options.length > 0 &&
                        item.options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                { option.label }
                            </SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>
        )
        break

      case 'textarea':
        element = (
            <Textarea
                id={item.name}
                name={item.name}
                placeholder={item.placeholder}
                value={currentControlItemValue}
                className="h-20 max-h-60"
                onChange={(event) => updateField(item.name, event.target.value)}
            />
        )
        break

      default:
        element = (
            <Input
                id={item.name}
                name={item.name}
                type={item.type}
                placeholder={item.placeholder}
                value={currentControlItemValue}
                onChange={(event) => updateField(item.name, event.target.value)}
            />
        )
        break
    }

    return element
  }

    return (
        <div className="flex flex-col gap-3">
            { formControls.map((controleItem) => (
                <div key={controleItem.name}>
                    <Label htmlFor={controleItem.name} className="ml-1">
                        { controleItem.label }
                    </Label>
                    <div className="mt-2">
                        { renderComponentByType(controleItem) }
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FormControls
