<script>
export default {
	props: {
		'value': Number, 'min': Number, 'max': Number,
		'leftToRight':{
			type: Boolean,
			default: true
		}
	},
	data: ()=>({
		pmouseCoord: undefined,
		pointerUpHandler: undefined,
		pointerMoveHandler: undefined
	}),
	methods:{
		posToValue: function(){
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			const pos = Number(this.$refs.handle.style[this.handlePositionAttr].replace(/(px|%)$/,''))
			
			return Number(this.min) + ( ( this.leftToRight ? pos : (max - pos) )/max)*(Number(this.max) - Number(this.min))
		},
		valueToPos: function(val){
			const alpha = (val -  Number(this.min))/( Number(this.max) -  Number(this.min))
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			return`${ ( this.leftToRight ? alpha : (1.0 - alpha) ) * max}px`
		},
		grabHandle: function(e){
			console.log( "grabHandle" )
			this.pmouseCoord = e[this.pointerPositionAttr]
			this.pointerUpHandler = this.releaseHandle().bind(this)
			document.addEventListener('mouseup', this.pointerUpHandler )
			this.pointerMoveHandler = this.onDrag.bind(this)
			document.addEventListener('mousemove', this.pointerMoveHandler )
			
		},
		touchGrabHandle: function(e){
			this.pmouseCoord = e[this.pointerPositionAttr]
			this.pointerUpHandler = this.releaseHandle('touchend','touchmove').bind(this)
			document.addEventListener('touchend', this.pointerUpHandler )
			this.pointerMoveHandler = this.onDrag.bind(this)
			document.addEventListener('touchmove', this.pointerMoveHandler )
			e.preventDefault()
		},
		releaseHandle: function( pointerUp = 'mouseup', pointerMove = 'mousemove'){
			return () => {
				document.removeEventListener( pointerUp, this.pointerUpHandler )
				document.removeEventListener( pointerMove, this.pointerMoveHandler )
				this.pointerUpHandler = undefined
				this.pointerMoveHandler = undefined
				this.$emit('change', this.posToValue() )
			}
		},
		onDrag: function(e){
			const delta = e[this.pointerPositionAttr] - this.pmouseCoord
			const pos = Number(this.$refs.handle.style[this.handlePositionAttr].replace(/(px|%)$/,''))
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			const newPos = Math.max( 0, Math.min( max, pos+delta) )
			this.$refs.handle.style[this.handlePositionAttr] = `${newPos}px`
			this.pmouseCoord = e[this.pointerPositionAttr]
			this.$emit('input', this.posToValue() )
		}
	},
	watch: {
		value: function(newVal, oldVal){ //update the position of the handle on value change
			if(this.pointerMoveHandler){ //don't update if currently holding the handle
				return
			}
			this.$refs.handle.style[this.handlePositionAttr] = this.valueToPos( newVal )
		}
	},
	mounted(){ //set initial position
			this.$refs.handle.style[this.handlePositionAttr] = this.valueToPos( this.value )
	}
}
</script>
