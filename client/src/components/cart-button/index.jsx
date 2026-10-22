import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/context/cart'

function CartButton() {
    const navigate = useNavigate()
    const { count, isInCart, addToCart, removeFromCart } = useCart()

    function handleClick(courseId) {
        if (isInCart(courseId)) {
            removeFromCart(courseId)
        } else {
            addToCart(courseId)
        }
    }

    return (
        <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative"
            aria-label={`Shopping cart with ${count} items`}
        >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
                <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1.5 text-xs font-bold tabular-nums"
                >
                    {count > 99 ? '99+' : count}
                </Badge>
            )}
        </button>
    )
}

export default CartButton
