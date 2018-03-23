<template>
	<div>
		<button v-on:click="previous">|<</button>
		<button v-on:click="playPause">{{ playing ? "||" : ">" }}</button>
		<button v-on:click="next">>|</button>
	</div>
</template>

<script>
import Player from "../api/player.js"
import PlayList from "../api/playlist.js"

export default {
	computed: {
		playing(){
			return this.$store.state.player.playing
		}
	},
	methods: {
		playPause: function(){
			Player.playPause()
		},
		previous: function(){
			PlayList.previous()
		},
		next: function(){
			PlayList.next()
		}
	},
	mounted(){
		this.$store.dispatch('player/checkStatus')
		//Poll CD state every second
		setInterval(() => {
			if( !document.hasFocus() ){
				return
			}
			this.$store.dispatch('player/checkStatus')
		}, 1000)

	}
}
</script>


<style scoped>

</style>
