<template>
	<div>
		<label for="title">Title</label>
		<input type="text" id="title" v-model="title" v-on:keyup="inputChanged">
		<label for="title">Artist</label>
		<input type="text" id="artist" v-model="artist" v-on:keyup="inputChanged">
		<ul v-if="results">
			<li v-for="release in releases">
				<span class="title">{{ release.title }}</span>
				by
				<span class="artist">{{ artists(release) }}</span>
				<span class="data">{{ release.date }}</span>
				<button v-on:click="choose(release)">That's the one!</button>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	data: ()=>({
		title: '',
		artist: ''
	}),
	computed: {
		results(){
		  return this.$store.state.search.results
		},
		releases(){
			return this.$store.state.search.results.releases
		}
	},
	methods: {
		artists: function(release){
			return release['artist-credit']
				.map( (entry) => entry.artist.name )
				.join(', ')
		},
		inputChanged: function(){
			/* only issue search query after the
         the user as stopped typing for X seconds
       */
			clearTimeout(this.fire)
			this.fire = setTimeout( () => {
				this.$store.dispatch('search/cd', [this.title, this.artist])
			}, 2000)
		},
		choose(release){
			this.$store.dispatch('search/selectCd', release.id)
		}
	}
}
</script>

<style scoped>
</style>

