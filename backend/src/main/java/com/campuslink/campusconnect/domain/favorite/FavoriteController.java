package com.campuslink.campusconnect.domain.favorite;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    // POST /api/books/{bookPostId}/favorite?userId={userId}
    @PostMapping("/{bookPostId}/favorite")
    public ResponseEntity<String> toggleFavorite(@PathVariable Long bookPostId, @RequestParam Long userId) {
        String resultMessage = favoriteService.toggleFavorite(bookPostId, userId);
        return ResponseEntity.ok(resultMessage);
    }
}